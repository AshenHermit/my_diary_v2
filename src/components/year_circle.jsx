import React from 'react'
import { PostStruct } from '../api'
import {client, _post_placeholder} from '../init'
import {default as utils} from '../utils'
import {months, start_year} from '../config'
import {isMobile} from 'react-device-detect'
import { searchParams } from '../searchParams'
import {default as Simplex} from '../lib/perlin-simplex'

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

        this.slow_view_position = 0
        this.slow_view_position_walk = 0
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

        this.canvas_scale = 1
        this.time = 0
        
        this.noise = new Simplex() // Math.round(Math.random()*100)

        client.year_circle_component = this
    }
    setPosts(posts_array){
        this.posts = posts_array
    }
    updateViewDate(view_position){
        var month = utils.positionToMonth(view_position)
        var year = utils.positionToYear(view_position)
        this.setState({month: month, year: year})
    }

    checkNearestPost(){
        var nearest_post = utils.getPostNearestToPosition(this.posts, this.view_position_target)

        if(nearest_post.uid != this.active_post.uid){
            client.setActivePost(nearest_post)
        }
    }

    /**
     * @param {PostStruct} post 
     */
    setActivePost(post, scroll_anyway=false){
        if(!client.is_in_edit_mode){
            this.view_position_target = post.position
            this.is_dragging = false
        }
        if(scroll_anyway){
            this.view_position_target = post.position
        }
        
        this.active_post = post
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
        }
    }
    mouseup(e){
        if(this.is_dragging){
            this.checkNearestPost()
        }
        this.is_dragging = false
    }

    setupCanvasEventListeners(){
        utils.initializeMouseEvents(this.canvas, this.mousedown, this.mousemove, this.mouseup)
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
        if(this.canvas_container_ref.current == null) return
        var client_rect = this.canvas_container_ref.current.getClientRects()[0]
        this.canvas_container_ref.current.style.height = client_rect.width + 'px'
        client_rect.height = client_rect.width
        
        this.canvas_scale = isMobile ? 2 : 1
        this.canvas.width = client_rect.width * this.canvas_scale
        this.canvas.height = client_rect.height * this.canvas_scale
    }

    static postPositionToAngle(position){
        var angle_offset = 2 * Math.PI / 12 * 2.5
        var angle = position / 12 * 2 * Math.PI
        angle += angle_offset
        return angle
    }

    drawCircle(circle_radius){
        this.ctx.lineWidth = 8 * this.canvas_scale
        
        for (let i = 0; i < 12; i++) {
            var month_angle = 2 * Math.PI / 12
            var angle_offset = 2 * Math.PI / 12 / 2
            var scale = 1;

            var viewPosFract = this.slow_view_position / 12
            viewPosFract = (viewPosFract - Math.floor(viewPosFract))
            viewPosFract = viewPosFract * 2 * Math.PI - month_angle * 1.5
            var sinRes = Math.sin(viewPosFract - i * month_angle)
            scale = 1 + (sinRes+1)/10
            this.ctx.globalAlpha = 1-(sinRes/2+0.5)
            this.ctx.lineWidth = 8 * Math.pow(scale, 10)

            // this.ctx.strokeStyle = i%2 == 0 ? "#353535" : "#3f3f3f"
            this.ctx.strokeStyle = "#353535"
            this.ctx.beginPath();
            this.ctx.arc(this.canvas.width/2, this.canvas.height/2, circle_radius*scale, 
                angle_offset+i*month_angle, 
                angle_offset+i*month_angle + month_angle*0.95);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0
        }
    }
    drawViewPosition(circle_radius, position){
        var angle = YearCircle.postPositionToAngle(position)
        
        var x = Math.cos(angle)
        var y = Math.sin(angle)
        
        this.ctx.lineWidth = 5 * this.canvas_scale
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
    drawPost(post, circle_radius, view_position){
        view_position = this.slow_view_position
        var post_is_active = post == this.active_post
        
        if(client.is_in_edit_mode && post_is_active){
            post = client.edit_mode_post
        }
        var position = post.position
        var angle = YearCircle.postPositionToAngle(position)
        var positionDifference = view_position - position
        if(Math.abs(positionDifference)>5) return

        var positionDifference = Math.pow(view_position - position, 2)
        var alpha = utils.clamp(1-Math.abs(positionDifference) / 10, 0, 1) * 0.5

        if(alpha<=0) return

        var centerDistanceOffset = 1 + (positionDifference / 40)
        var noise = this.noise.noise(post.position/3, this.time/500 + this.slow_view_position_walk/5)
        noise *= 0.06 * (positionDifference / 5 + 0.2)
        var noise2 = this.noise.noise(post.position/3, - this.time/500 - this.slow_view_position_walk/5)
        noise2 *= 0.1 * (positionDifference / 5 + 0.2)
        centerDistanceOffset = centerDistanceOffset + noise
        
        var x = Math.cos(angle+noise2) * (circle_radius) * centerDistanceOffset
        var y = Math.sin(angle+noise2) * (circle_radius) * centerDistanceOffset

        this.ctx.globalAlpha = alpha
        this.ctx.lineWidth = 5 * this.canvas_scale
        // this.ctx.strokeStyle = post_is_active ? "#ffc677" : "#353535"
        this.ctx.strokeStyle = "#fff"
        this.ctx.fillStyle = "#fff"
        var size = post.size
        var title = post.title

        if(post_is_active){
            this.ctx.fillStyle = "#ffc677"
            this.ctx.strokeStyle = "#ffc677"
            this.ctx.globalAlpha = 1
        }
        size = size * circle_radius / 6

        this.ctx.save();
        var font_height = Math.floor(circle_radius/15+this.canvas_scale*2)
        this.ctx.font = font_height+"px monospace";
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
        var offset = 8
        if(post.type==1) offset += 2
        if(x > 0){
            this.ctx.rotate(angle+noise2)
            this.ctx.translate(circle_radius*centerDistanceOffset+size + offset, 4);
            this.ctx.textAlign = "left"
        }else{
            this.ctx.rotate(angle + Math.PI+noise2)
            this.ctx.translate(-circle_radius*centerDistanceOffset-size - offset, 4);
            this.ctx.textAlign = "right"
        }
        this.ctx.fillText(title, 0, 0)
        this.ctx.restore();
        
        this.ctx.beginPath()
        this.ctx.arc(this.canvas.width/2 + x, this.canvas.height/2 + y, size, 0, 2 * Math.PI)
        if(post.type==0)
            this.ctx.fill()
        else if(post.type==1)
            this.ctx.stroke()

        this.ctx.globalAlpha = 1
    }
    draw(){
        requestAnimationFrame(this.draw)
        this.time += 1
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        var view_position_target = this.view_position_target
        this.view_position += (view_position_target - this.view_position)/3
        let old_view_position = this.slow_view_position
        this.slow_view_position += (this.view_position - this.slow_view_position)/10
        this.slow_view_position_walk += Math.abs(this.slow_view_position - old_view_position)
        var view_position = this.view_position

        const circle_radius = this.canvas.width*0.3


        this.drawViewPosition(circle_radius, view_position)

        this.drawCircle(circle_radius)

        for (let i = 0; i < this.posts.length; i++) {
            const post = this.posts[i];
            if(post.uid != this.active_post.uid){
                this.drawPost(post, circle_radius, view_position)
            }
        }
        this.drawPost(this.active_post, circle_radius, view_position)

        if (Math.floor(view_position) != this.last_month){
            this.updateViewDate(view_position)
        }
        this.last_month = Math.floor(view_position)
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