import {Client} from './client'
import {Api, PostStruct} from './api'
import {default as utils} from './utils'

export var api = new Api()
export var client = new Client(api)

export var _post_placeholder = PostStruct.build_placeholder()

window.api = api
window.client = client
window.utils = utils