import json

def get_nested_value(dict, key):
    # First, try to find the key as-is in the global dictionary
    if key in dict:
        return dict[key]
    
    keys = key.split('.')
    
    # Start with the first key in the global dictionary
    value = dict.get(keys[0], None)
    
    # Loop over the remaining keys to access nested values
    for key in keys[1:]:
        if value is None:
            return None
        
        # Try and convert to dict/list
        try:
            value = json.loads(value)
            if isinstance(value, list) or isinstance(value, dict):
                value = value
        except Exception:
            pass
        
        # If the key represents an integer index, try list access
        if key.isdigit():
            try:
                idx = int(key)
                value = value[idx]
            except (IndexError, TypeError):
                return None
        # Otherwise assume dictionary access
        else:
            try:
                value = value.get(key, None)
            except AttributeError:
                return None
    return value