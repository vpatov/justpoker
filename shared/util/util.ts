import util from "util";

export function generateUUID(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

export function printObj(obj: any) {
  console.log(util.inspect(obj, false, null, true));
}
