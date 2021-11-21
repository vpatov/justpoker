# <a href="https://justpoker.games">JustPoker</a>
<img src="https://github.com/justpoker-team/justpoker/blob/master/docs/jp_koi.png?raw=true" alt="Image of JP Mascot" width="250"/>

### Stacks:

- **UI** React + TS 

- **Server** Node + TS + Express + Typedi (handles boh HTTPS + WS)


### Setting up a local development environment
Running docker is not necessary to develop locally.
The server and the UI are separate packages, with their own dependencies.
Due to a limitation in the configuration options of create-react-app, the shared TS interfaces/models are found in `ui/src/shared/models` as opposed to some other top-level directory.

After cloning repo, run
`npm run preinstall`

Running backend server:
```
cd server && npm run start
```

Running React UI server:
```
cd ui && npm run start
```

Afterwards, navigate to `http://localhost:3000/` to view the app (HTTPS is not enabled when running locally).
### Testing multiple players locally
Users are identified via the `jp-client-uuid` key in local storage, so to test with multiple users you need to use either a different browser, and/or incognito mode. For example, to test with four players, you can connect to the app from Chrome, Chrome (Incognito), Firefox, Firefox (incognito). You can also try deleting the local storage yourself, but that is probably more error-prone and gets harder to manage.

### Contributing
The `master` branch is protected (cannot push directly to `master`). We strive to keep the `master` branch in a stable, production-ready state at all times. Make changes on a separate branch, and then create a PR when the changes are ready for review. After the PR has been reviewed by the other maintainers, and any comments have been addressed, the PR can be approved, and then merged into `master` (barring any merge conflicts).


