import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from "react-router-dom";
import {Row, Col} from 'reactstrap';
import TextEditorAsideContainer from './TextEditorAsideContainer';
import TextEditorContainer from './TextEditorContainer';
import FileExplorerContainer from './FileExplorerContainer';
import TextEditorToolbarContainer from './TextEditorToolbarContainer';
import {
  fetchEditorTabs as fetchEditorTabsAction,
  contracts as contractsAction,
  file as fileAction,
  transaction as transactionAction
} from '../actions';
import {getCurrentFile, getContracts, getTransaction} from '../reducers/selectors';
import {getDebuggerTransactionHash} from '../utils/utils';
import classnames from 'classnames';

import './EditorContainer.css';

class EditorContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentAsideTab: '',
      showHiddenFiles: false,
      currentFile: this.props.currentFile,
    };
  }

  componentDidMount() {
    this.props.fetchEditorTabs();
    this.props.fetchContracts();
    this.props.fetchTransaction(this.props.debuggerTransactionHash);
  }

  componentDidUpdate(prevProps) {
    if(this.props.currentFile.path !== prevProps.currentFile.path) {
      this.setState({currentFile: this.props.currentFile});
    }

    if(this.props.contracts && this.props.transaction !== prevProps.transaction) {
      const debuggingContract = this.props.contracts.find(contract => contract.address === this.props.transaction.to)
      if (debuggingContract) {
        this.setState({currentAsideTab: 'debugger'})
        this.props.fetchFile({path: debuggingContract.path});
      }
    }
  }

  isContract() {
    return this.state.currentFile.name && this.state.currentFile.name.endsWith('.sol');
  }

  onFileContentChange(newContent) {
    const newCurrentFile = this.state.currentFile;
    newCurrentFile.content = newContent;
    this.setState({currentFile: newCurrentFile});
  }

  toggleShowHiddenFiles() {
    this.setState({showHiddenFiles: !this.state.showHiddenFiles});
  }

  openAsideTab(newTab) {
    if (newTab === this.state.currentAsideTab) {
      return this.setState({currentAsideTab: ''});
    }
    this.setState({currentAsideTab: newTab});
  }

  textEditorMdSize() {
    return this.state.currentAsideTab.length ? 7 : 10;
  }

  render() {
    return (
      <Row noGutters className={classnames('h-100', 'editor--grid', {'aside-opened': this.state.currentAsideTab.length})}>
        <Col xs={12}>
          <TextEditorToolbarContainer openAsideTab={(newTab) => this.openAsideTab(newTab)}
                                      isContract={this.isContract()}
                                      currentFile={this.props.currentFile}
                                      activeTab={this.state.currentAsideTab}/>
        </Col>
        <Col sm={4} md={2} xl={2} lg={2} className="border-right">
          <FileExplorerContainer showHiddenFiles={this.state.showHiddenFiles} toggleShowHiddenFiles={() => this.toggleShowHiddenFiles()} />
        </Col>
        <Col sm={8} md={this.textEditorMdSize()} className="text-editor-container">
          <TextEditorContainer currentFile={this.props.currentFile} onFileContentChange={(newContent) => this.onFileContentChange(newContent)} />
        </Col>
        {this.state.currentAsideTab &&
        <Col sm={12} md={3} className="border-left-0 relative">
          <div className="editor-aside">
             <TextEditorAsideContainer debuggerTransactionHash={this.props.debuggerTransactionHash}
                                       currentAsideTab={this.state.currentAsideTab}
                                       currentFile={this.props.currentFile} />
          </div>
        </Col>}
      </Row>
    );
  }
}

function mapStateToProps(state, props) {
  const currentFile = getCurrentFile(state);
  const debuggerTransactionHash = getDebuggerTransactionHash(props.location);

  return {
    currentFile,
    debuggerTransactionHash,
    transaction: getTransaction(state, debuggerTransactionHash),
    contracts: getContracts(state)
  };
}

EditorContainer.propTypes = {
  debuggerTransactionHash: PropTypes.string,
  contracts: PropTypes.array,
  transaction: PropTypes.object,
  fetchContracts: PropTypes.func,
  fetchFile: PropTypes.func,
  fetchTransaction: PropTypes.func,
  currentFile: PropTypes.object,
  fetchEditorTabs: PropTypes.func
};

export default withRouter(connect(
  mapStateToProps,
  {
    fetchEditorTabs: fetchEditorTabsAction.request,
    fetchTransaction: transactionAction.request,
    fetchFile: fileAction.request,
    fetchContracts: contractsAction.request
  },
)(EditorContainer));

