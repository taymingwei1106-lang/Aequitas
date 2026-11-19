import { useEffect, useState } from "react";

import { FILES_CHANGED, listFiles } from "../services/fileStore";

/*
 * Stored document metadata for one property (or all, when propertyId is
 * undefined), kept current as files are added or removed anywhere.
 *
 * Returns { files, ready, error }.
 */
export default function useFiles(propertyId) {
  const [state, setState] = useState({ files: [], ready: false, error: null });

  useEffect(() => {
    let active = true;

    function load() {
      listFiles(propertyId)
        .then((files) => active && setState({ files, ready: true, error: null }))
        .catch((error) => active && setState({ files: [], ready: true, error: error.message }));
    }

    load();
    window.addEventListener(FILES_CHANGED, load);
    return () => {
      active = false;
      window.removeEventListener(FILES_CHANGED, load);
    };
  }, [propertyId]);

  return state;
}
