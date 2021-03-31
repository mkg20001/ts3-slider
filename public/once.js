'use strict'

function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function') {
    throw new TypeError('need wrapper function')
  }

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper () {
    const args = new Array(arguments.length)
    for (let i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    const ret = fn.apply(this, args)
    const cb = args[args.length - 1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}

once.proto = wrappy(once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
}))

function once (fn) {
  const f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  const f = function () {
    if (f.called) {
      throw new Error(f.onceError)
    }
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  const name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}
