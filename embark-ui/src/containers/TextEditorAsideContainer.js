import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Card, CardBody} from 'reactstrap';

import Preview from '../components/Preview';
import {getContractsByPath} from "../reducers/selectors";
import ContractDetail from '../components/ContractDetail';
import ContractTransactionsContainer from './ContractTransactionsContainer';
import ContractOverviewContainer from '../containers/ContractOverviewContainer';
import ContractDebuggerContainer from '../containers/ContractDebuggerContainer';

class TextEditorAsideContainer extends Component {
  renderContent(contract, index) {
    switch (this.props.currentAsideTab) {
      case 'detail':
        return (
          <React.Fragment>
            <h2>{contract.className} - Details</h2>
            <ContractDetail key={index} contract={contract}/>
          </React.Fragment>
        );
      case 'transactions':
        return (
          <React.Fragment>
            <h2>{contract.className} - Transactions</h2>
            <ContractTransactionsContainer key={index} contract={contract}/>
          </React.Fragment>
        );
      case 'overview':
        return (
          <React.Fragment>
            <h2>{contract.className} - Interact</h2>
            <ContractOverviewContainer key={index} contract={contract}/>
          </React.Fragment>
        );
      default:
        return '';
    }
  }

  render() {
    if (this.props.currentAsideTab === 'browser') {
      return <Preview/>;
    }
    if (this.props.currentAsideTab === 'debugger') {
      return (
        <React.Fragment>
          <h2>Debugger</h2>
          <ContractDebuggerContainer debuggerTransactionHash={this.props.debuggerTransactionHash}/>
        </React.Fragment>
      );
    }
    return this.props.contracts.map((contract, index) => (
      <Card key={'contract-' + index} className="editor-aside-card rounded-0 border-top-0">
        <CardBody>
          {this.renderContent(contract, index)}
        </CardBody>
      </Card>
    ));
  }
}

function mapStateToProps(state, props) {
  return {
    contracts: getContractsByPath(state, props.currentFile.path)
  };
}

TextEditorAsideContainer.propTypes = {
  currentFile: PropTypes.object,
  debuggerTransactionHash: PropTypes.string,
  currentAsideTab: PropTypes.string,
  contracts: PropTypes.array
};

export default connect(
  mapStateToProps,
  {}
)(TextEditorAsideContainer);
