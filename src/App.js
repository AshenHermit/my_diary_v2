import logo from './logo.svg';
import './App.css';
import React from 'react'
import {api, client} from './init'
import {MainContent} from './components/main_content'
import {MusicMenu} from './components/music_menu'
import {IconButton} from './components/editable_components'

class TopBar extends React.Component{
  constructor(props){
    super(props)
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
        <IconButton icon_src="res/notes.png" onClick={()=>{client.toggleMusicMenu()}}/>
      </div>
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
