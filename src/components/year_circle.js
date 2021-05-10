import React from 'react'
import { PostStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {months, start_year} from '../config'

export class YearCircle extends React.Component{
    constructor(props){
        super(props)
        this.state = {month: 0, year: 2021}

        this.posts = [_post_placeholder]
        
        this.canvas_container_ref = React.createRef()
        this.canvas_ref = React.createRef()
        /**@type {HTMLCanvasElement} */
        this.canvas = null
        /**@type {CanvasRenderingContext2D} */
        this.ctx = null

        this.active_post = _post_placeholder

        this.view_position = 0
        this.view_position_target = 0
 
        this.resizeCanvas = this.resizeCanvas.bind(this)
        this.draw = this.draw.bind(this)

        this.mousedown = this.mousedown.bind(this)
        this.mousemove = this.mousemove.bind(this)
        this.mouseup = this.mouseup.bind(this)

        this.is_dragging = false
        this.drag_start_mouse_pos = 0
        this.drag_start_view_pos = 0

        this.last_month = 0

        client.year_circle_component = this
    }
    setPosts(posts_array){
        this.posts = posts_array
    }
    updateViewDate(){
        var month = utils.mod(Math.floor(this.view_position), 12)
        var year = start_year + Math.floor(this.view_position/12)
        this.setState({month: month, year: year})
    }

    checkNearestPost(){
        var nearest_post = utils.getPostNearestToPosition(this.posts, this.view_position_target)

        if(nearest_post != this.active_post){
            this.setActivePost(nearest_post)
        }
    }

    /**
     * @param {PostStruct} post 
     */
    setActivePost(post){
        this.view_position_target = post.position
        this.active_post = post
        this.is_dragging = false
        client.setActivePost(this.active_post)
    }
    
    componentDidMount(){
        client.year_circle_component = this
        this.setupCanvas()
        this.draw()
    }
    mousedown(e){
        this.is_dragging = true
        this.drag_start_mouse_pos = e.pageX
        this.drag_start_view_pos = this.view_position_target
    }
    mousemove(e){
        if(this.is_dragging){
            this.view_position_target = this.drag_start_view_pos + (e.pageX - this.drag_start_mouse_pos)/100
            this.checkNearestPost()
        }
    }
    mouseup(e){
        this.is_dragging = false
    }

    setupCanvasEventListeners(){
        this.canvas.addEventListener('mousedown', this.mousedown)
        window.addEventListener('mousemove', this.mousemove)
        window.addEventListener('mouseup', this.mouseup)

        this.canvas.addEventListener('touchstart', e=>this.mousedown(e.changedTouches[0]))
        window.addEventListener('touchmove', e=>this.mousemove(e.changedTouches[0]))
        window.addEventListener('touchend', e=>this.mouseup(e.changedTouches[0]))
        window.addEventListener('touchcancel', e=>this.mouseup(e.changedTouches[0]))
    }
    setupCanvas(){
        this.canvas = this.canvas_ref.current
        this.ctx = this.canvas.getContext('2d')
        
        // resize canvas when container resized
        new ResizeObserver(this.resizeCanvas)
            .observe(this.canvas_container_ref.current)
        this.resizeCanvas()
        this.setupCanvasEventListeners()
    }
    resizeCanvas(){
        var client_rect = this.canvas_container_ref.current.getClientRects()[0]
        this.canvas_container_ref.current.style.height = client_rect.width + 'px'
        client_rect.height = client_rect.width
        this.canvas.width = client_rect.width
        this.canvas.height = client_rect.height
    }

    static postPositionToAngle(position){
        var angle_offset = 2 * Math.PI / 12 * 2.5
        var angle = position / 12 * 2 * Math.PI
        angle += angle_offset
        return angle
    }

    drawCircle(circle_radius){
        this.ctx.lineWidth = 8
        
        for (let i = 0; i < 12; i++) {
            var month_angle = 2 * Math.PI / 12
            var angle_offset = 2 * Math.PI / 12 / 2

            // this.ctx.strokeStyle = i%2 == 0 ? "#353535" : "#3f3f3f"
            this.ctx.strokeStyle = "#353535"
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width/2, this.canvas.height/2, circle_radius, 
                angle_offset+i*month_angle, 
                angle_offset+i*month_angle + month_angle*0.95);
            this.ctx.stroke();
        }
    }
    drawViewPosition(circle_radius){
        var angle = YearCircle.postPositionToAngle(this.view_position)
        
        var x = Math.cos(angle)
        var y = Math.sin(angle)
        
        this.ctx.lineWidth = 5
        this.ctx.strokeStyle = "#fff"
        this.ctx.globalAlpha = 0.1
        this.ctx.beginPath();
        this.ctx.moveTo(
            this.canvas.width/2 + x * (circle_radius * 0.5), 
            this.canvas.height/2 + y * (circle_radius * 0.5)
        );
        this.ctx.lineTo(
            this.canvas.width/2 + x * (circle_radius * 0.8), 
            this.canvas.height/2 + y * (circle_radius * 0.8)
        );
        this.ctx.stroke();
        this.ctx.globalAlpha = 1
    }
    /**
     * @param {PostStruct} post 
     */
    drawPost(post, circle_radius){
        var angle = YearCircle.postPositionToAngle(post.position)
        
        var x = Math.cos(angle) * (circle_radius)
        var y = Math.sin(angle) * (circle_radius)
        
        this.ctx.globalAlpha = utils.clamp(1-Math.abs(this.view_position - post.position) / 3, 0, 1) * 0.5
        if(this.ctx.globalAlpha > 0){
            this.ctx.lineWidth = 5
            this.ctx.strokeStyle = post == this.active_post ? "#ffc677" : "#353535"
            this.ctx.fillStyle = "#fff"
            if(post == this.active_post){
                this.ctx.fillStyle = "#ffc677"
                this.ctx.globalAlpha = 1
            }

            this.ctx.save();
            var font_height = Math.floor(circle_radius/15)
            this.ctx.font = font_height+"px monospace";
            this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
            if(x > 0){
                this.ctx.rotate(angle)
                this.ctx.translate(circle_radius*1.12, 4);
                this.ctx.textAlign = "left"
            }else{
                this.ctx.rotate(angle + Math.PI)
                this.ctx.translate(-circle_radius*1.12, 4);
                this.ctx.textAlign = "right"
            }
            this.ctx.fillText(post.title, 0, 0)
            this.ctx.restore();
            
            this.ctx.beginPath()
            this.ctx.arc(this.canvas.width/2 + x, this.canvas.height/2 + y, post.size * circle_radius / 10, 0, 2 * Math.PI)
            this.ctx.fill()
        }
        this.ctx.globalAlpha = 1
    }
    draw(){
        requestAnimationFrame(this.draw)
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.view_position += (this.view_position_target-this.view_position)/3

        const circle_radius = this.canvas.width*0.3

        this.drawViewPosition(circle_radius)

        this.drawCircle(circle_radius)

        for (let i = 0; i < this.posts.length; i++) {
            const post = this.posts[i];
            if(post != this.active_post){
                this.drawPost(post, circle_radius)
            }
        }
        this.drawPost(this.active_post, circle_radius)

        if (Math.floor(this.view_position) != this.last_month){
            this.updateViewDate()
        }
        this.last_month = Math.floor(this.view_position)
    }

    render(){
        return (
            <div ref={this.canvas_container_ref} className="year-circle">
                <div className="year-circle-view-date">
                    <div className="year-circle-view-date-year">{this.state.year}</div>
                    <div className="year-circle-view-date-month">{months[this.state.month]}</div>
                </div>
                <canvas ref={this.canvas_ref} className="year-circle-canvas"></canvas>
            </div>
        )
    }
}