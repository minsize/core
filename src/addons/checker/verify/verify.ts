import { generateUniqueKey } from '@minsize/utils' // Импорт утилиты для генерации уникального ключа
import store from '../../../store' // Импорт локального хранилища для хранения хешей

/**
 * Функция для проверки изменения функции, используя хеши.
 *
 * @param {Function} func - Функция, для которой необходимо проверить целостность.
 * @param {string} name - Имя функции или модуля, используемое как ключ в хранилище.
 * @returns {boolean} - Возвращает `true`, если хеши отличаются, указывая на изменения; иначе `false`.
 */
function verify(func: Function, name: string) {
	// Проверка, если `this` не определён (или ложный), выполнить самопроверку
	if (!this) {
		// Используется `Function.prototype.bind`, чтобы привязать `true` и снова вызвать `verify`
		if (verify.bind(true)(verify, 'checker')) return true
	}

	// Генерирует уникальный ключ (или хеш) для переданной функции
	const key = generateUniqueKey(func)

	// Проверка: если для данного `name` уже есть сохранённый хеш в хранилище и он отличается от текущего
	if (store.hash[name] !== undefined && store.hash[name] !== key) {
		// Если хеш отличается, возвращает `true`, указывая на изменение
		return true
	}

	// Обновляет или сохраняет текущий хеш в хранилище для данного `name`
	store.hash[name] = key

	// Возвращает `false`, указывая, что изменений нет
	return false
}

export default verify // Экспортирует функцию для использования в других частях приложения
