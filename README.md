# Gridcoin Web Client

The original intent of this project was to provide a decent GUI for a headless Gridcoin Research (GRC) node (e.g. a Raspberry Pi), but it works just as well on workstations.

This software currently performs _only_ read-only actions, so it does not allow the user to make transactions, lock or unlock their wallet, or vote in polls. That functionality is planned, so stay tuned.

## Getting Started

### Prerequisites

You will need to be running a `gridcoinresearchd` daemon with RPC enabled for this software to work properly. Note that at the time of writing, it seems that the full Gridcoin wallet GUI will not allow RPC even if it is configured.

Steps for compiling `gridcoinresearchd` from source can be found on the [Gridcoin Wiki](http://wiki.gridcoin.us/Linux_guide#Build_Gridcoin_Daemon).

#### gridcoinresearch.conf

```
rpcuser=your_username
rpcpassword=your_password
rpcport=your_rpc_port
rpcallowip=127.0.0.1
```

I _strongly_ encourage you to only allow RPC from localhost. Change `rpcallowip` at your own risk.

### Installation

Installation is fairly straightforward. Just clone or otherwise download a copy of this repository. After that you need to package the front-end code with webpack.

```
$ git clone https://github.com/rsparlin/Gridcoin-Web-Client.git
$ cd Gridcoin-Web-Client
$ npm install
$ npm run build-prod
```

### Configuration

Configuration is stored in the `config/` directory as JSON. The `default.json` file can be used as a template. Either modify `default.json` or create another that exactly matches your `NODE_ENV`.

I highly recommend you `chmod 600` your configuration files to prevent other users from reading them.

#### Example config

```json
{
	"rpc": {
		"baseurl": "http://localhost:5001/",
		"username": "your_user",
		"password": "your_password"
	},
	"reverseDns": true,
	"geolocate": true
}
```

The following are the available options:

- `rpc.baseurl` -- This should be set to the URL for your gridcoinresearchd RPC server. Typically all you will need to do for this is change the port.
- `rpc.username` and `rpc.password` -- These should match the `rpcuser` and `rpcpassword` values in your `gridcoinresearch.conf`.
- `reverseDns` -- When this is true, peers' IP addresses will be resolved to hostnames through DNS. This may slow the initial loading of the peer list.
- `geolocate` -- When this is true, peers' locations will be determined using [freegeoip](https://freegeoip.net/). This may also slow the initial loading of the peer list.

### Starting

To keep the server running, I recommend using [PM2](http://pm2.keymetrics.io/). To that end, you can use the provided `ecosystem.config.js` file. Modify it to your liking and then start it under the `production` environment.

```
$ sudo npm install -g pm2
$ pm2 start ecosystem.config.js --env production
```

You can also just run it directly. You can specify the IP and port to bind on if you dislike the defaults (localhost on 8080). The following will work in Bash (sorry Windows users):

```
$ NODE_ENV=production GWC_HOST=localhost GWC_PORT=8080 npm start
```

Having PM2 launch on boot is also nice to have. See the [relevant documentation](http://pm2.keymetrics.io/docs/usage/startup/) for how to do that. For the lazy, the following should get you going:

```
$ pm2 start ecosystem.config.js --env production
$ pm2 save
$ sudo pm2 startup -u "$(whoami)" --hp "$HOME"
```

## Built With

* [Hapi](https://hapijs.com/) - Back-end framework (web server)
* [React](https://reactjs.org/) - UI framework
* [Semantic UI React](https://react.semantic-ui.com) - UI framework
* [Webpack](https://webpack.js.org/) - Bundler

See other dependencies in the `package.json`.

## Contributing

I'm very much welcome to bug reports, feature requests, and pull requests, though I can't say how long it will take me to follow up on them. I would love to devote more time to this project, but I still need to pay my bills somehow :)


### Code Style

If you want to contribute code by submitting a pull request, I ask that you adhere to the code style.

This project adheres (mostly) to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript). Before submitting a pull request, make sure you are following it by running eslint with the included `.eslintrc.json` config file.

### Branching strategy

At this point I only see a need to have two branches, `development` and `master`. If there becomes a need for it, I may add a staging branch. Pull requests should be performed against the `development` branch, and I will merge changes into `master` as things become stable. Releases will be tagged for those concerned with stability.

## Authors

* [**Ryan Sparlin**](https://github.com/rsparlin) - Initial work

See also the list of [contributors](https://github.com/rsparlin/Gridcoin-Web-Client/contributors) who participated in this project.

## License

This project is licensed under the MIT License; see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

Thanks to the [Gridcoin Project](https://www.gridcoin.us/), a cryptocurrency whose cause I can actually believe in.

Thanks also to [PurpleBooth](https://github.com/PurpleBooth) for this great [readme template](https://gist.github.com/PurpleBooth/109311bb0361f32d87a2). I'm new to the open source software development scene, so it helped a bunch.
