export function createLockedBlock(type, config = {}) {
  return {
    type,
    enabled: config.enabled !== false,
    lockedDesign: true,
    allowContentEditing: true,
    allowReorder: true,
    allowDisable: true,
    allowStyleEditing: false,
    props: config.props || {},
  };
}

export default createLockedBlock;
