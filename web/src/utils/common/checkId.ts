/**
 * Checks if the id is a valid ID from backend or
 * a UUID generated for the frontend
 *
 * @param {string} id - ID to check
 * @return {string} Either the required numerical ID or 0
 */
function checkId(id: string): string {
  if (!/^\d+$/.test(id)) {
    return "0";
  } else {
    return id;
  }
}

export default checkId;
