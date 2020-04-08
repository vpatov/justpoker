export function generateUUID() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// export function debugMethod(target: any, name: any, desc: any) {
//     const method = desc.value;
//     desc.value = () => {
//         const prevMethod = this.currentMethod;
//         console.log(name);
//         method.apply(this, arguments);
//     }
// }

export function debugMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  console.log(propertyKey);
}
