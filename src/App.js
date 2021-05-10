import logo from './logo.svg';
import './App.css';
import React from 'react'
import {api, client} from './init'
import {MainContent} from './components/main_content'
import {MusicMenu} from './components/music_menu'

class IconButton extends React.Component{
  constructor(props){
      super(props)
  }
  render(){
    return (
      <button className="icon-button" onClick={this.props.onClick}>
        <img src={this.props.icon_src}></img>
      </button>
    )
  }
}

class TopBar extends React.Component{
  constructor(props){
      super(props)
  }
  render(){
      return (
      <div className="top-bar">
        <IconButton icon_src={"res/pencil_and_paper.png"} onClick={()=>{client.toggleEditMode()}}/>
        <IconButton icon_src={"res/notes.png"} onClick={()=>{client.toggleMusicMenu()}}/>
      </div>
      )
  }
}

class Footer extends React.Component{
  constructor(props){
    super(props)
  }
  render(){
    return (
      <div className="footer">
        
      </div>
    )
  }
}

class App extends React.Component{
  constructor(props){
    super(props)
  }
  componentDidMount(){
    client.initialize()
  }
  render(){
    return (
      <div className="App">
        <MusicMenu/>
        <TopBar/>
        <MainContent/>
        <Footer/>
      </div>
    )
  }
}

export default App;
