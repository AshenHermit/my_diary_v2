import React from 'react'
import {isMobile} from 'react-device-detect'
import { TrackStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {EditableComponent, EditorInput, IconButton} from './editable_components'
import {Label} from './elements'
import { TagsInput } from 'react-tag-input-component'
import { months } from '../config'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

class ProjectComponent extends React.Component{
    static defaultProps = {
        onTagClicked: null,
        project: null
    }
    constructor(props){
        super(props)
        this.onTagClicked = this.onTagClicked.bind(this)
        this.goToPost = this.goToPost.bind(this)
        this.project = this.props.project
    }
    componentDidMount(){
        client.activePostChanged.subscribe(()=>{this.forceUpdate()})
    }
    onTagClicked(tag){
        if(this.props.onTagClicked){
            this.props.onTagClicked(tag)
        }
    }
    goToPost(){
        client.goToPost(this.project.post.uid)
    }
    render(){
        var year = utils.positionToYear(this.project.post.position)
        var month = months[utils.positionToMonth(this.project.post.position)]

        this.project = this.props.project
        var circleIcon = client.active_post.projects.indexOf(this.project)!=-1 ? "filled_circle" : "circle_stroke"
        circleIcon = "res/"+circleIcon+".png"

        return (
            <div className='project-item' style={this.props.style}>
                <div>
                    {this.project.image_url == "" ? '':
                        <img className='project-image' src={this.project.image_url} alt="project"></img>
                    }
                </div>
                <div className='fields'>
                    <div className="project-title">
                        <div>{this.project.title}</div>
                        <IconButton icon_src={circleIcon} onClick={this.goToPost}/>
                    </div>
                    <div className='project-item-date'>{year} {month}</div>
                    <div className="project-description"> <span
                        dangerouslySetInnerHTML={{__html: utils.renderMarkup(this.project.description)}}>
                        </span>
                        {/* <span className="project-description-reveal">more</span> */}
                    </div>
                    <div className="project-tags-container">
                        {this.project.tags.map((tag, i)=>{
                            return <div id={"tag-"+i} onClick={()=>{this.onTagClicked(tag)}} className='project-tag'>{tag}</div>
                        })}
                    </div>
                </div>
            </div>
        )
    }
}

export class ProjectsMenu extends React.Component{
    constructor(props){
        super(props)
        client.projects_menu = this
        this.frame = React.createRef()
        this.is_shown = true
        this.toggle = this.toggle.bind(this)
        this.applySearch = this.applySearch.bind(this)
        this.searchTag = this.searchTag.bind(this)
        this.searchTags = []
    }
    gatherProjects(){
        var projects = client.api.data.posts.sort((x,y)=>{
            if (x.position > y.position) return -1
            if (x.position < y.position) return 1
        }).map(post=>{
            post.projects.forEach(proj=>{proj.post = {uid: post.uid, position: post.position}})
            if(this.searchTags.length==0){
                return post.projects
            }else{
                return post.projects.filter(p=>{
                    return this.searchTags.every(tag => p.tags.includes(tag))
                })
            }
        }).flat()
        return projects
    }
    componentDidMount(){
        // super.componentDidMount()
        if(!isMobile) utils.windowMenuHeightAdjust(this.frame.current)
        client.api.dataLoaded.subscribe(()=>{this.forceUpdate()})

        if(this.props.hide) this.hide()
    }
    show(){
        this.frame.current.style.display = ''
        this.is_shown = true
    }
    hide(){
        this.frame.current.style.display = 'none'
        this.is_shown = false
    }
    toggle(){
        if(this.is_shown) this.hide()
        else this.show()
        this.forceUpdate()
    }
    applySearch(tags){
        this.searchTags = tags
        this.forceUpdate()
    }
    searchTag(tag){
        this.searchTags = [tag]
        this.forceUpdate()
    }
    render(){
        this.projects = this.gatherProjects()
        return (
            <div className="projects-menu" ref={this.frame}>
                <div className='projects-menu-grid'>
                    <div className="projects-search">
                        <div className='projects-search-label'>Projects search</div>
                        <TagsInput onChange={this.applySearch} value={this.searchTags}/>
                    </div>
                    <div className="projects-list">
                        <TransitionGroup className="show-group">
                        {this.projects.map((project, i)=>{
                            return (
                                <CSSTransition
                                    key={i}
                                    classNames="show"
                                    timeout={500 + i*100}
                                    >
                                    <ProjectComponent 
                                        style={{ transitionDelay: `${(i+1)*100}ms` }}
                                        key={"project_"+i} 
                                        project={project}
                                        onTagClicked={this.searchTag}/>
                                </CSSTransition>
                            )
                        })}
                        </TransitionGroup>
                    </div>
                </div>
            </div>
        )
    }
}