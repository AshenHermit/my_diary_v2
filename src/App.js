import logo from './logo.svg';
import './App.css';
import './animations.css';
import React, { createRef } from 'react'
import {api, client} from './init'
import {MainContent} from './components/main_content'
import {MusicMenu} from './components/music_menu'
import {IconButton, MenuToggleButton} from './components/editable_components'
import { AboutPanel } from './components/about_panel';
import { PopupsList } from './components/popups_list';
import { ProjectsMenu } from './components/projects_menu';
import { isMobile } from 'react-device-detect';

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
        <MenuToggleButton icon_src="res/projects.png" menu={this.props.projects_menu}/>
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
        <MenuToggleButton icon_src="res/notes.png" menu={this.props.music_menu}/>
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
          {client.api.lastUpdate!="" ? <span style={{fontSize:"14px", color: "#bdbdbd"}}> - последнее обновление</span> : ""}
        </div>
      </div>
    )
  }
}

class App extends React.Component{
  constructor(props){
    super(props)
    this.projectsMenuRef = createRef()
    this.topbarRef = createRef()
    this.musicMenuRef = createRef()
  }
  componentDidMount(){
    client.initialize()
    this.topbarRef.current.forceUpdate()
  }
  render(){
    let globalUiCenter = (
      <div className='global-ui-center'>
        <div className="floating-window">
          <ProjectsMenu ref={this.projectsMenuRef} hide={isMobile}/>
        </div>
        <div className="floating-window">
          <MusicMenu ref={this.musicMenuRef} hide={isMobile}/>
        </div>
      </div>
    )

    return (
      <div className="App">
        <div className='global-ui'>
          <TopBar ref={this.topbarRef} projects_menu={this.projectsMenuRef} music_menu={this.musicMenuRef}/>
          {!isMobile ? globalUiCenter : ''}
        </div>
        <AboutPanel/>
        <PopupsList/>
        <MainContent/>
        {isMobile ? globalUiCenter : ''}
        <Footer/>
      </div>
    )
  }
}

export default App;
