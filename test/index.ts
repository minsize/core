import mcore from '../src'

//Тестовый плагин
import TestPlugin from './plugins'

mcore.register([TestPlugin()])

console.log(lang('test'))
console.log(lang('test1'))
setTimeout(() => {
	console.log(lang('test2'))
}, 2000)
