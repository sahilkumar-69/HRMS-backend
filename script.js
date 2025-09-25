function outer() {
  let a = 32;
  return function () {
    console.log(a);
  };
}

let hello = outer();

hello();

console.log(hello);
