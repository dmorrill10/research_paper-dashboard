require('jquery');
require('jquery-ujs');
require('./style/index.sass');
require('bootstrap-sass/assets/javascripts/bootstrap.min.js');

import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
const marked = require('marked');

import React from 'react';
import ReactDOM from 'react-dom';
import Communicator from './src/communicator';


function afterRender(selector, f) {
  const elem = $(selector);
  if (elem && elem.length) {
    return f();
  } else {
    return window.requestAnimationFrame(() => {
      return afterRender(selector, f);
    });
  }
}

function afterHasSize(selector, f) {
  const elem = $(selector);
  if (elem && elem.length && elem.height() > 0.0 && elem.width() > 0.0) {
    return f();
  } else {
    return window.requestAnimationFrame(() => {
      return afterHasSize(selector, f);
    });
  }
}

// Create a client side Feathers application that uses the socket for connecting
// to services
let app = feathers();
app.configure(socketio(io('/')));
let communicator = new Communicator(app);

import ReactJson from 'react-json-view'

class Reference extends React.Component {
  render() {
    const l = [
      (
        <p key='reference-title' className='reference-title'>
          {this.props.title}
        </p>
      ),
      (
        <ul key='reference-notes' className='reference-notes'>
          {this.props.notes.map((note, i) => <li key={i}>{note}</li>)}
        </ul>
      )
    ];
    return <div>{l}</div>;
  }
}

class PaperDetails extends React.Component {
  render() {
    let l = [
      (
        <ul key='authors' className='authors'>
          {this.props.authors.map((author, i) => <li key={i}>{author}</li>)}
        </ul>
      )
    ];
    if (this.props.url !== undefined && this.props.url !== null) {
      l.push(
        <a key='url' className='url' href={this.props.url}>
          Link to Paper
        </a>
      );
    }
    l.push(
      <div key='abstract' className='abstract'>
        Abstract: {this.props.abstract}
      </div>
    );
    l.push(
      <div key='introduction' className='introduction'>
        Introduction: {this.props.introduction}
      </div>
    );
    l.push(
      <div key='conclusion' className='conclusion'>
        Conclusion: {this.props.conclusion}
      </div>
    );
    // ,
    // (
    //   <div key='outline' className='outline'>
    //     {this.props.outline}
    //   </div>
    // ),
    // (
    //   <div key='notes' className='notes'>
    //     {this.props.notes}
    //   </div>
    // ),
    if (this.props.references !== undefined && this.props.references !== null) {
      l.push(
        <ul key='references' className='references'>
          {
            this.props.references.map(
              (reference, i) => {
                let l2 = [];
                if ('link' in reference) {
                  l2.push(
                    <a key='citation' className='citation' href={`#paper-${reference.link}`}>
                      {reference.citation}
                    </a>
                  );
                } else {
                  l2.push(
                    <p key='citation' className='citation'>
                      {reference.citation}
                    </p>
                  );
                }
                l2.push(
                  <Reference key={`reference-${i}`} title={reference.title} notes={reference.notes} />
                );
                return <li key={i}>{l2}</li>;
              }
            )
          }
        </ul>
      );
    }
    return <div key='paper-details' className='paper-details'>{l}</div>;
  }
}

class Paper extends React.Component {
  render() {
    const l = [
      (
        <button
          key='button'
          id={`paper-${this.props.id}`}
          className="btn"
          type="button"
          data-toggle="collapse"
          data-target={`#${this.props.id}`}
          aria-expanded="false"
          aria-controls={this.props.id}>
          {this.props.title}
        </button>
      ),
      (
        <div key='row' className='row'>
          <div className="collapse multi-collapse" id={this.props.id}>
            <PaperDetails
              authors={this.props.authors}
              url={this.props.url}
              abstract={this.props.abstract}
              introduction={this.props.introduction}
              conclusion={this.props.conclusion}
              outline={this.props.outline}
              notes={this.props.notes}
              references={this.props.references} />
          </div>
        </div>
      )
    ];
    return <div key={`paper-${this.props.id}`}>{l}</div>;
  }
}

function main() {
  communicator.findPapers().then(function (data) {
    return ReactDOM.render(
      (
        <ul>{
            data.map(
              (paper, id) => {
                return (
                  <Paper
                      key={id}
                      id={id}
                      title={paper.title}
                      authors={paper.authors}
                      url={paper.url}
                      abstract={paper.abstract}
                      introduction={paper.introduction}
                      conclusion={paper.conclusion}
                      outline={paper.outline}
                      notes={paper.notes}
                      references={paper.references} />
                );
              }
            )
          }</ul>
      ),
      document.getElementById('app')
    );
  });
}

const loadedStates = ['complete', 'loaded', 'interactive'];
if (loadedStates.includes(document.readyState) && document.body) {
  main();
} else {
  window.addEventListener('DOMContentLoaded', main, false);
}
