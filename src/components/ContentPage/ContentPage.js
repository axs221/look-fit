/*! React Starter Kit | MIT License | http://www.reactstarterkit.com/ */

import React, { PropTypes } from 'react';
import styles from './ContentPage.css';
import withStyles from '../../decorators/withStyles';
import $ from 'jquery';

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

  componentWillMount() {
    console.log('componentWillMount');
    console.log(this.props.accessToken);
    if (this.props.accessToken != undefined && this.props.accessToken != null) {
      this.getHeartRateData(this.props.accessToken);
    }
  };

  getHeartRateData(accessToken) {
    console.log('Getting heart rate data');        
    $.ajax({
      //url: 'https://api.fitbit.com/1/user/-/activities/heart/date/today/1w.json',
      url: 'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d/1sec.json',
      headers: {"Authorization": "Bearer " + accessToken},
      success: (data) => {
        console.log('Success!');
        console.log(data);
      }
    });

  };

  render() {
    this.context.onSetTitle(this.props.title);
    return (
      <div>
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
