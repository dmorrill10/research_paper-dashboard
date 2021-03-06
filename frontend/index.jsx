require('jquery');
require('jquery-ujs');
require('./style/index.sass');

import 'bootstrap'
import io from 'socket.io-client';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
const marked = require('marked');

import React from 'react';
import ReactDOM from 'react-dom';
import Communicator from './src/communicator';


function keyIsPresent(o, k) {
  return k in o && o[k] !== undefined && o[k] !== null;
}

class MyReactComponent extends React.Component {
  propIsPresent(k) {
    return keyIsPresent(this.props, k);
  }
}

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

class Reference extends MyReactComponent {
  render() {
    const l = [
      (
        <p key='reference-title' className='reference-title'>
          {this.props.title}
        </p>
      ),
      (
        <ul key='reference-notes' className='reference-notes'>
          {renderListOfMarkdownNotes(this.props.notes)}
        </ul>
      )
    ];
    return <div>{l}</div>;
  }
}

class Section extends MyReactComponent {
  render() {
    let l = [<p key='section-title' className='section-title'>{this.props.title}</p>];
    if (this.propIsPresent('notes')) {
      l.push(
        <ul key='section-notes' className='section-notes'>
          {renderListOfMarkdownNotes(this.props.notes)}
        </ul>
      );
    }
    if (this.propIsPresent('subsections')) {
      l.push(
        <ul key='subsections' className='subsections'>
          {
            this.props.subsections.map(
              (section, i) => (
                <li key={i} className='subsection'>
                  <Section key={i} title={section.title} notes={section.notes} subsections={section.subsections} />
                </li>
              )
            )
          }
        </ul>
      );
    }
    return <div className='section'>{l}</div>;
  }
}

class CardComponent extends MyReactComponent {
  id() { return this.props.id; }
  render() {
    return (
      <div className={`${this.name()} card`}>
        {[
          (
            <div key={`${this.name()}-header`} className={`${this.name()}-header card-header`} role='tab' id={`${this.name()}-${this.id()}`}>
              <h5 className="mb-0">
                <a data-toggle="collapse" href={`#${this.name()}-${this.id()}-details`} aria-expanded="false" aria-controls={`${this.name()}-${this.id()}-details`}>
                  {this.title()}
                </a>
              </h5>
            </div>
          ),
          (
            <div
              key={`${this.name()}-${this.id()}-details`}
              className="collapse multi-collapse"
              id={`${this.name()}-${this.id()}-details`}
              role="tabpanel"
              aria-labelledby={`${this.name()}-${this.id()}`}
              data-parent={`${this.name()}-${this.id()}`}>
              <div className="card-body">
                {this.details()}
              </div>
            </div>
          )
        ]}
      </div>
    );
  }
}

class Authors extends CardComponent {
  name() { return 'authors'; }
  title() { return 'Authors'; }
  details() {
    return (
      <ul key='authors' className='authors'>
        {this.props.names.map((name, i) => <li key={i}>{name}</li>)}
      </ul>
    );
  }
}

class Outline extends CardComponent {
  name() { return 'outline'; }
  title() { return 'Outline'; }
  details() {
    return (
      <ul>
        {
          this.props.sections.map((section, i) =>
            <li key={i}>
              <Section title={section.title} notes={section.notes} subsections={section.subsections} />
            </li>
          )
        }
      </ul>
    );
  }
}

class FirstReadSummary extends CardComponent {
  name() { return 'first-read-summary'; }
  title() { return 'First Read Summary'; }
  details() {
    let l = [];
    if (this.propIsPresent('abstract')) {
      l.push(
        <div key='abstract' className='abstract'>
          <div className='title'>Abstract</div>
          <div className='summary'>{this.props.abstract}</div>
        </div>
      );
    }
    if (this.propIsPresent('introduction')) {
      l.push(
        <div key='introduction' className='introduction'>
          <div className='title'>Introduction</div>
          <div className='summary'>{this.props.introduction}</div>
        </div>
      );
    }
    if (this.propIsPresent('conclusion')) {
      l.push(
        <div key='conclusion' className='conclusion'>
          <div className='title'>Conclusion</div>
          <div className='summary'>{this.props.conclusion}</div>
        </div>
      );
    }
    return l;
  }
}

function renderListOfMarkdownNotes(notes) {
  return notes.map((note, i) => {
    const md = marked.parse(note, {sanitize: true});
    return <li key={i} dangerouslySetInnerHTML={{__html:md}} />;
  });
}

class Notes extends CardComponent {
  name() { return 'notes'; }
  title() { return 'Notes'; }
  details() {
    return (
      <ul key='notes' className='notes'>
        {renderListOfMarkdownNotes(this.props.notes)}
      </ul>
    );
  }
}

class References extends CardComponent {
  name() { return 'references'; }
  title() { return 'References'; }
  details() {
    return (
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
}

class PaperDetails extends MyReactComponent {
  render() {
    let l = [];
    if (this.propIsPresent('url')) {
      l.push(
        <a key='url' className='btn btn-primary url' href={this.props.url}>
          <span className="oi oi-data-transfer-download"></span>
        </a>
      );
    }
    if (this.propIsPresent('authors')) {
      l.push(<Authors key='authors' id={this.props.id} names={this.props.authors} />);
    }
    l.push(<FirstReadSummary key='first-read-summary' id={this.props.id} abstract={this.props.abstract} introduction={this.props.introduction} conclusion={this.props.conclusion} />);
    if (this.propIsPresent('outline')) {
      l.push(<Outline key='outline' id={this.props.id} sections={this.props.outline} />);
    }
    if (this.propIsPresent('notes')) {
      l.push(<Notes key='notes' id={this.props.id} notes={this.props.notes} />);
    }
    if (this.propIsPresent('references')) {
      l.push(<References key='references' id={this.props.id} references={this.props.references} />);
    }
    return <div key='paper-details' className='paper-details'>{l}</div>;
  }
}

class Paper extends CardComponent {
  name() { return 'paper'; }
  title() { return this.props.title; }
  details() {
    return (
      <PaperDetails
        id={this.props.id}
        authors={this.props.authors}
        url={this.props.url}
        abstract={this.props.abstract}
        introduction={this.props.introduction}
        conclusion={this.props.conclusion}
        outline={this.props.outline}
        notes={this.props.notes}
        references={this.props.references} />
    );
  }
}

function main() {
  communicator.findPapers().then(function (data) {
    return ReactDOM.render(
      (
        <div className='papers' id="accordion" role="tablist">{
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
          }</div>
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
