import store from '../../store'
import type { Plugin } from '../../types'
import verify from '../checker/verify/verify'
import { onMessage } from './events'

/**
 * Регистрация плагина
 *
 * Эта функция добавляет массив плагинов к уже существующему
 * списку плагинов и инициализирует каждый из добавленных плагинов,
 * вызывая их метод `init`.
 *
 * @param this - Контекст вызова функции, который ожидается как объект
 *               со свойством `plugins`, представляющим массив уже зарегистрированных плагинов.
 * @param plugins - Массив плагинов, которые необходимо зарегистрировать и инициализировать.
 */
export function register(plugins: Plugin[]) {
	// Добавляем все переданные плагины в существующий массив плагинов.
	store.plugins.push(...plugins)

	// Инициализируем каждый из переданных плагинов после добавления
	for (const plugin of plugins) {
		if (!plugin.uid || !plugin.version || !plugin.name || !plugin.init) {
			onMessage.bind(plugin)({
				type: 'critical',
				details: 'error plugin.json',
			}) // Плагин не смог инициализироваться из за неправильного конфига
		}

		try {
			plugin.init({
				onMessage: onMessage.bind(plugin),
				verify,
			}) // Предполагается, что каждый плагин имеет метод `init`
		} catch {
			onMessage.bind(plugin)({
				type: 'critical',
				details: 'init error',
			}) // Плагин не смог инициализироваться
		} finally {
			onMessage.bind(plugin)({
				type: 'debug',
				details: 'init success',
			}) // Плагин инициализирован
		}
	}
}
