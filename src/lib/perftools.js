// Functions to get all active events

//conda install -c conda-forge gperftools


export const events = listAllEventListeners

function listAllEventListeners(select = '*', not='ignore',sort_by = 'etype') {
    const allElements = Array.prototype.slice.call(document.querySelectorAll(`${select}:not(${not})`));
  
      allElements.push(document);
      allElements.push(window);
    
      console.debug(allElements)
    
      const types = [];
    
      for (let ev in window) {
        if (/^on/.test(ev)) types[types.length] = ev;
      }
    
      let elements = [];
      for (let i = 0; i < allElements.length; i++) {
        const currentElement = allElements[i];
  
      for (const [key, values] of Object.entries(getEventListeners(currentElement))) {
          values.forEach(ev=>{
              const fn = ev.listener
              if (typeof fn === 'function') {
                  elements.push({
                    "etype":currentElement.nodeName,
                    'id':currentElement.id,
                    "ctype":currentElement.className,
                    "node": currentElement,
                    "type": key,
                    "func": fn.toString(),
                  });
                }
  
          })
              
  
         
          
        }
  
  
      }
    
      return elements.sort(function(a,b) {
        return a.type.localeCompare(b[sort_by]);
      });
    }
  