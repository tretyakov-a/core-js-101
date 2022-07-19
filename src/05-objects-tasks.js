/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return this.width * this.height;
    },
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = new proto.constructor();
  Object.assign(obj, JSON.parse(json));
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function ICssBuilder() {}

class MyCssSelector extends ICssBuilder {
  constructor(items = []) {
    super();
    this.items = items;
    const T = MyCssSelector.ITEM_TYPES;
    this.disposableTypes = [T.ELEMENT, T.ID, T.PSEUDO_ELEMENT];
  }

  validate(type) {
    const typesCounter = this.disposableTypes.reduce((acc, t) => {
      if (!acc[t]) acc[t] = 0;
      acc[t] = this.items.filter((item) => item.type === t).length;
      return acc;
    }, {});
    if (this.disposableTypes.includes(type) && typesCounter[type] === 1) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    const lastItem = this.items[this.items.length - 1];
    if (lastItem && type < lastItem.type) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
  }

  add(value, type) {
    const T = MyCssSelector.ITEM_TYPES;
    if (type !== T.SELECTOR) {
      this.validate(type);
    }
    let newValue = '';
    switch (type) {
      case T.ID: newValue = `#${value}`; break;
      case T.CLASS: newValue = `.${value}`; break;
      case T.ATTR: newValue = `[${value}]`; break;
      case T.PSEUDO_CLASS: newValue = `:${value}`; break;
      case T.PSEUDO_ELEMENT: newValue = `::${value}`; break;
      case T.COMBINATOR: newValue = ` ${value} `; break;
      case T.ELEMENT: default: newValue = value; break;
    }
    if (type === T.SELECTOR) {
      this.items.push(...newValue.items);
    } else {
      this.items.push({ value: newValue, type });
    }
    return this;
  }

  stringify() {
    return this.items.map(({ value }) => value).join('');
  }
}

MyCssSelector.ITEM_TYPES = {
  ELEMENT: 0,
  ID: 1,
  CLASS: 2,
  ATTR: 3,
  PSEUDO_CLASS: 4,
  PSEUDO_ELEMENT: 5,
  COMBINATOR: 6,
  SELECTOR: 7,
};

const cssSelectorBuilder = {
  add(value, type) {
    if (!(this instanceof MyCssSelector)) {
      return (new MyCssSelector()).add(value, type);
    }
    return this;
  },

  element(value) {
    return this.add(value, MyCssSelector.ITEM_TYPES.ELEMENT);
  },

  id(value) {
    return this.add(value, MyCssSelector.ITEM_TYPES.ID);
  },

  class(value) {
    return this.add(value, MyCssSelector.ITEM_TYPES.CLASS);
  },

  attr(value) {
    return this.add(value, MyCssSelector.ITEM_TYPES.ATTR);
  },

  pseudoClass(value) {
    return this.add(value, MyCssSelector.ITEM_TYPES.PSEUDO_CLASS);
  },

  pseudoElement(value) {
    return this.add(value, MyCssSelector.ITEM_TYPES.PSEUDO_ELEMENT);
  },

  combine(selector1, combinator, selector2) {
    return selector1
      .add(combinator, MyCssSelector.ITEM_TYPES.COMBINATOR)
      .add(selector2, MyCssSelector.ITEM_TYPES.SELECTOR);
  },
};

Object.keys(cssSelectorBuilder).forEach((key) => {
  ICssBuilder.prototype[key] = cssSelectorBuilder[key];
});
ICssBuilder.prototype.constructor = ICssBuilder;

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
