const util = require('util');
const execFile = util.promisify(require('child_process').execFile);

class BoincCmd {
  constructor(cmdPath) {
    this.cmdPath = cmdPath;
  }

  async execute(host, password, ...args) {
    const passwd = password ? ['--passwd', password] : [];
    const { stdout } = await execFile(this.cmdPath, ['--host', host, ...passwd, ...args], {
      timeout: 10000,
      windowsHide: true,
    });

    return stdout;
  }

  static parseOutput(body, sectionless) {
    /* Parse output */
    const sectionSeparator = /^=+[\w\s]+=+$/;
    const itemSeparator = /^\d+\)\s-+$/;

    const lines = body.split(/\n/);

    if (sectionless) {
      return lines
        .reduce((ret, line) => {
          const kv = line.trimLeft().split(':');

          if (kv.length >= 2) {
            const [key, ...val] = kv;
            return Object.assign(ret, {
              [key]: val.join(':').trimLeft(),
            });
          }

          return ret;
        }, {});
    }
    const sections = {};
    let section;
    let item;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];

      if (line.match(sectionSeparator)) {
        const sectionName = line.replace(/=/g, '').trim();

        /* Time stats has only one item */
        item = (sectionName === 'Time stats') ? {} : undefined;
        section = item ? [item] : [];
        sections[sectionName] = section;
      } else if (line.match(itemSeparator)) {
        if (!section) throw Error(`Found new item without section: ${line}`);

        item = {};
        section.push(item);
      } else {
        const kv = line.trimLeft().split(':');

        if (kv.length >= 2) {
          if (!item) throw Error(`Found new value without item: ${line}`);

          const [key, ...val] = kv;
          item[key] = val.join(':').trimLeft();
        }
      }
    }

    return sections;
  }

  async getState(host, password) {
    return BoincCmd.parseOutput(await this.execute(host, password, '--get_state'));
  }

  async getHostInfo(host, password) {
    return BoincCmd.parseOutput(await this.execute(host, password, '--get_host_info'), true);
  }

  async getTasks(host, password) {
    return BoincCmd.parseOutput(await this.execute(host, password, '--get_tasks')).Tasks;
  }
}

module.exports = BoincCmd;
