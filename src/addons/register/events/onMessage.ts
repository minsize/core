import type { PluginJson, Message } from '../../../types'

// Функция, которая обрабатывает сообщения определённого типа
// `this` — это объект типа `PluginJson`
// `options` — это объект типа `Message`
export function onMessage(this: PluginJson, options: Message) {
	// Изначально используем консольный лог для вывода
	var log = console.log

	// Определяем метод логирования в зависимости от типа сообщения
	switch (options.type) {
		case 'critical': {
			log = console.error // Для критических ошибок используем `console.error`
			break
		}
		case 'debug': {
			log = console.debug // Для отладочных сообщений используем `console.debug`
			break
		}
		case 'info': {
			log = console.info // Для информативных сообщений используем `console.info`
			break
		}
		case 'warning': {
			log = console.warn // Для предупреждений используем `console.warn`
			break
		}
		// Нет необходимости в default-блоке, так как `log` по умолчанию равен `console.log`
	}

	// Выводим сообщение с форматом
	log(
		`-------------\n[${this.name} v(${this.version})]\n${JSON.stringify(
			options.details,
			null,
			2
		)}\n-------------`
	)
}
