export function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error("发生错误:", error.message);
  } else if (typeof error === "string") {
    console.error("发生错误:", error);
  } else {
    console.error("发生未知错误:", error);
  }
}
