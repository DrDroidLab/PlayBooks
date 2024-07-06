function checkId(id: string) {
  if (isNaN(parseInt(id, 10))) {
    return "0";
  } else {
    return id;
  }
}

export default checkId;
