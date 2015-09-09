/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes } from 'react';
import styles from './ContentPage.css';
import withStyles from '../../decorators/withStyles';

@withStyles(styles)
class ContentPage {

  static propTypes = {
    path: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    title: PropTypes.string,
    accessToken: PropTypes.string
  };

  static contextTypes = {
    onSetTitle: PropTypes.func.isRequired,
    accessToken: PropTypes.string.isRequired
  };

  render() {
    console.log('My props');
    console.log(this.props);
    this.context.onSetTitle(this.props.title);
    return (
      <div>
        <p>Access token: {this.props.accessToken}</p>
        <div className="ContentPage">
          <div className="ContentPage-container">
            {
              this.props.path === '/' ? null : <h1>{this.props.title}</h1>
            }
            <div dangerouslySetInnerHTML={{__html: this.props.content || ''}} />
          </div>
        </div>
      </div>
    );
  }

}

export default ContentPage;
