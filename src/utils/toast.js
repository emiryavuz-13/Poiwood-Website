let toastHandler = null;

export const setToastHandler = (handler) => {
  toastHandler = handler;
};

export const triggerToast = (type, product, onUndo) => {
  if (toastHandler) toastHandler({ type, product, onUndo });
};

export const triggerCartToast = (product) => triggerToast('cart', product);

export const triggerFavoriteToast = (product, added = true, onUndo) =>
  triggerToast(added ? 'favorite-add' : 'favorite-remove', product, onUndo);

export const triggerActionToast = ({ type = 'success', title, message }) => {
  if (toastHandler) toastHandler({ type: `action-${type}`, title, message });
};
