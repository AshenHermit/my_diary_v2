import React from 'react'

export class Label extends React.Component{
    constructor(props){
        super(props)
    }
    render(){
        return (
            <div className="label">
                {this.props.text}
            </div>
        )
    }
}
