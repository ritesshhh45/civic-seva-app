# Android hardware back behavior

- Add the Capacitor App plugin and a guarded, native-only back-button listener with cleanup, navigation fallback, and the two-press home exit toast.
- Initialize the listener once from the root layout and remove it on unmount.
- Show a back arrow on the requested inner screens; navigate to the previous screen when possible and otherwise return to Home.
- Verify with the production build and Capacitor Android sync; leave notifications, login, and backend behavior unchanged.
