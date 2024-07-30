function checkId(id: string) {
  if (!/^\d+$/.test(id)) {
    return "0";
  } else {
    return id;
  }
}

export default checkId;
