import {Client} from './client'
import {Api, PostStruct} from './api'
import {default as utils} from './utils'

// вот эти вот все фцвфцв.цфв || фцв пфцп это короче чтобы реакт development server не ругался при изменении кода,
// он писал ReferenceError: Cannot access 'Api' before initialization
// обязательно надо как-то по другому это решать
export var api = window.api || new Api()
export var client = window.client || new Client(api)

export var _post_placeholder = window._post_placeholder || PostStruct.build_placeholder()

window.api = api
window.client = client
window.utils = utils
window._post_placeholder = _post_placeholder