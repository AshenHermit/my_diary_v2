import logo from './logo.svg';
import './App.css';
import React from 'react'
import {api, client} from './init'
import {MainContent} from './components/main_content'
import {MusicMenu} from './components/music_menu'
import {IconButton} from './components/editable_components'
import { AboutPanel } from './components/about_panel';

class TopBar extends React.Component{
  constructor(props){
    super(props)
    this.state = {username:""}
  }
  componentDidMount(){
    client.topbar_component = this
  }
  render(){
    return (
    <div className="top-bar">
      <div className="top-bar-item">
        <IconButton icon_src="res/pencil_and_paper.png" onClick={()=>{client.toggleEditMode()}}/>
        <IconButton visible={client.is_in_edit_mode} icon_src="res/floppy_memory.png" onClick={()=>{client.saveActivePost()}}/>
      </div>

      <div className="top-bar-item">
        {/* {this.state.username==""?
          <div className="sign-in-with-google" onClick={window.onGoogleSignInClick()}>Sign in with Google</div>
          :
          <div className="signed-in">{this.state.username}</div>
        } */}
      </div>

      <div className="top-bar-item">
        <IconButton icon_src="res/about.png" onClick={()=>{client.toggleAboutPanel()}}/>
        <IconButton icon_src="res/notes.png" onClick={()=>{client.toggleMusicMenu()}}/>
      </div>
    </div>
    )
  }
}

class Footer extends React.Component{
  constructor(props){
    super(props)
    client.footer_component = this
  }
  render(){
    return (
      <div className="footer">
        <div className="last-update">
          {client.api.lastUpdate}
          { client.api.lastUpdate!="" ? <span style={{fontSize:"14px", color: "#bdbdbd"}}> - последнее обновление</span> : ""}
        </div>
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
        <div className="floating-window">
          <MusicMenu/>
        </div>
        <AboutPanel/>
        <TopBar/>
        <MainContent/>
        <Footer/>
      </div>
    )
  }
}

export default App;
