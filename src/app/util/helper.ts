export class Helper {
  /**
   * Creates a deep copy of {@link object}.
   *
   * @param object any
   * @returns {any} a copy of {@link object}.
   */
  static copy(object: any): any {
    // dates
    if(object instanceof Date) {
      return new Date(object.getTime());
      // arrays
    } else if(object instanceof Array) {
      const target = [];

      for(const obj of object) {
        target.push(this.copy(obj));
      }

      return target;
      // objects
    } else if(object instanceof Object) {
      const target: any = {};

      // handle objects such as Map, Set, etc.
      if(object.forEach) {
        return new object.constructor(object);
      } else {
        for(const prop in object) {
          if(object.hasOwnProperty(prop)) {
            target[prop] = this.copy(object[prop]);
          }
        }
      }

      return target;
    } else {
      // it's a primitive
      return object;
    }
  }
}
