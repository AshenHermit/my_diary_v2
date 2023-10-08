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
          {client.api.data.last_update}
          {client.api.data.last_update!="" ? <span style={{fontSize:"14px", color: "#bdbdbd"}}> - последнее обновление</span> : ""}
        </div>
      </div>
    )
  }
}

class AppClosingEffect extends React.Component{
  constructor(props){
    super(props)
    this.audio = new Audio();
    this.audio.src = './res/low_freq_glitch.ogg';
    this.audioLoaded = false;
    this.audio.addEventListener('loadedmetadata', () => {
      this.audioLoaded = true;
    });    
    this.timer = 1.0
    this.isClosing = false
    this.effectRef = createRef()
    this.textVariants = []
    let words = "what is this taste, is it night or a day, give me more of it, become disconnected, leap with us, planet earth is about to be recycled".split(" ")
    for(let i = 0; i < 10; i++) {
      let seq = ""
      for(let i = 0; i < 6; i++) {
        seq += words[Math.floor(Math.random() * words.length)] + ' '
      }
      this.textVariants.push(seq)
    }
    window.closingeffect = this
  }
  randomizeElements(){
    const elements = document.body.querySelectorAll('*');
    elements.forEach(element => {
      const strength = false
      // Генерируем случайные смещения
      const x = Math.random() * 40 - 20;
      const y = Math.random() * 40 - 20;
      // Устанавливаем смещения элементу
      element.style.transform = `translate(${x}px, ${y}px)`;
      if(this.timer>0.5){
        if(element.childElementCount === 0 && element.textContent.trim() !== ''){
          element.textContent = this.textVariants[Math.floor(Math.random() * this.textVariants.length)]
        }
      }
    });
  }    
  update(delta){
    if (this.isClosing){
      this.randomizeElements()
      this.timer-=delta
      if (this.timer<=0.0){
        let url = window.location.toString()
        window.open(url.substring(0, url.lastIndexOf("/")), '_self')
        document.body.innerHTML = ""
      }
    }
  }
  close(){
    console.log(this.audioLoaded)
    if(!this.isClosing && this.audioLoaded){
      this.isClosing = true
      this.audio.play()
      this.effectRef.current.style.display = 'block'
    }
  }
  render(){
    return (
      <div ref={this.effectRef} className='effect-overlay'>
        <img src='https://i.gifer.com/9XaO.gif'></img>
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

    this.lastAnimationTime = 0
    this.globalFadeValue = 1.0
    this.globalFadeValueTarget = 1.0
    this.appClosingEffectRef = createRef()
  }
  componentDidMount(){
    client.initialize()
    this.topbarRef.current.forceUpdate()
    requestAnimationFrame(this.animation.bind(this))
  }
  animation(time){
    const delta = (time - this.lastAnimationTime) / 1000.0;
    this.appClosingEffectRef.current.update(delta)
    
    this.globalFadeValueTarget = 1.0
    if (client.active_post){
      if (client.active_post.notAbsorbing()){
        this.globalFadeValueTarget = 1.0
      }else{
        this.appClosingEffectRef.current.close()
      }
    }

    this.lastAnimationTime = time
    requestAnimationFrame(this.animation.bind(this))
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
        <AppClosingEffect ref={this.appClosingEffectRef}></AppClosingEffect>
      </div>
    )
  }
}

export default App;
