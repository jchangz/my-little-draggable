export function swap(arr: Array<number>, index1: number, index2: number) {
  const newArr = [...arr];
  if (index1 !== index2) {
    const element = arr[index1];
    newArr.splice(index1, 1);
    newArr.splice(index2, 0, element);
  }
  return newArr;
}
