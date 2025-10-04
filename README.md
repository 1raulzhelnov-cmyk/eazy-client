# Lets Create Easy — Client App (Flutter)

Professionalized structure for the client app with feature-first architecture. UI remains unchanged compared to the original Lowable build; only internals (state, structure, naming, imports) were refactored.

## Structure
```
apps/client_app/
  lib/
    core/        # router, theme, network, firebase
    features/    # auth, splash, home, ...
    shared/      # widgets, utils, extensions, constants
    main.dart
```

## Tech
- State: flutter_riverpod
- Navigation: go_router
- Firebase: core, auth (+ firestore/storage planned)
- Networking: Dio

## Scripts
- Install deps: `flutter pub get`
- Analyze: `flutter analyze`

## Notes
- Visuals, layouts, and UI logic were preserved 1:1. Internal code only was restructured.
- See `docs/project_plan_summary.md` and `docs/structure_audit.md` for details.
