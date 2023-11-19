// SpcFORK - https://replit.com/@SpcFORK/SpcFORK?v=1
// © 2023 SpcFORK

const
  // @ DEPS
  axios = (globalThis.require ? require('axios') : false),

  // @ DATA
  ENDURLS = {
    api: 'https://api.economyplus.solutions/api/',
    front: 'https://economyplus.solutions/api/'
  },

  RATELIMIT = 500, // Req's per 1s

  FP_Core_Instance = class {
    constructor() {
      return this.set({
        "name": typeof "",
        "cpu": typeof 1,
        "ram": typeof 1,
        "ramused": typeof 1,
        "cpuused": typeof 1.1, // NOTE: float 
        "online": typeof true,
      })
    }

    set(data) {
      return Object.assign(this, data)
    }
  },

  FP_Shard = class extends FP_Core_Instance {
    constructor() {
      super()
      return this.set({
        "slotsavailable": typeof 1,
        "slotsused": typeof 1
      })
    }
  },

  FP_Load_Balancer = class extends FP_Core_Instance {
    constructor() {
      super()
      return this.set({
        "acceptingnewbots": typeof true,
        "botsonline": typeof 1,
        "connectionavailable": typeof 1
      })
    }

  },

  FP_Batch_Processing_Server = class extends FP_Core_Instance {
    constructor() {
      super()
      return this.set({
        "calculationsavailable": typeof 1,
        "calculationsused": typeof 1
      })
    }
  },

  ENDPOINTS = {
    // GET - https://api.economyplus.solutions/api/resources
    // GET - https://economyplus.solutions/api/resources
    // GET - https://api.economyplus.solutions/api/getconnected 

    back_resources: {
      method: 'GET',
      url: ENDURLS.api + 'resources',
      get struct() {
        return {
          // 0 is falsy
          "guilds": typeof 1,
          "membercount": typeof 1,
          "kickrecords": typeof 1,
          "activity": typeof [1],
          "kickactivity": typeof [1]
        }
      }
    },

    front_resources: {
      method: 'GET',
      url: ENDURLS.front + 'resources',
      // @ Ware

      // ---

      get struct() {
        return {
          "machines": [
            // Expect:
            // - shards
            // - loadbalancers
            // - batchprocessingservers
          ]
        }

      },

      buildInstance(type) {
        switch (type) {
          case 'shard':
            return new FP_Shard()
          case 'loadbalancer':
            return new FP_Load_Balancer()
          case 'batchprocessingserver':
            return new FP_Batch_Processing_Server()

          default: throw new Error('Invalid Type')
        }
      },

      isFP_CI(core_inst) {
        switch (core_inst) {
          case typeof FP_Shard: return true;
          case typeof FP_Load_Balancer: return true;
          case typeof FP_Batch_Processing_Server: return true;
          default: return false;
        }
      },

    },

    get_connected: {
      method: 'GET',
      url: ENDURLS.api + 'getconnected',

      get struct() {
        return {
          "online": typeof true,
          "ping": typeof 1,
          "connections": typeof 1,
          "messages": typeof 1,
          "uptime": typeof 1
        }
      },

    },
  },

  USER_AGENT = 'SPC/FORK Axios (Fairplay-API-Wrapper/1.2; v1.0.0) JSON no/Web'

// console.log(ENDPOINTS)

// @ FUNCTIONS
async function get_resources(endp) {
  try {

    if (axios) {
      const res = await axios.request({
        method: endp.method,
        url: endp.url,
        responseType: 'json',
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json'
        }
      })

      return res.data
    } else {
      const res = fetch(endp.url, {
        method: endp.method,
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      })

      return res
    }

  } catch (err) {
    console.log(err)
  }
}

// @ SEMI-METHODS
function contains(str, substr) {
  return str.indexOf(substr) > -1;
}

async function get_connected() {
  let res = await get_resources(ENDPOINTS.get_connected);
  return res
}

async function get_back_resources() {
  let res = await get_resources(ENDPOINTS.back_resources);
  return res
}

function handle_machinesArr(machinesArr = []) {
  let arr = [];

  for (let i = 0; i < machinesArr.length; i++) {
    let n_ = machinesArr[i]?.name?.toLowerCase?.() || ''
    let fn_ = '';

    if (contains(n_, 'shard')) fn_ = 'shard';
    else if (contains(n_, 'load balancer')) fn_ = 'loadbalancer';
    else if (contains(n_, 'batch processing server')) fn_ = 'batchprocessingserver';

    else {
      console.log(machinesArr[i])
      throw new Error('Unseen/New Machine Type, Contact Developer, may be error.')
    }

    let inst = ENDPOINTS.front_resources.buildInstance(fn_);
    inst.set(machinesArr[i])
    arr.push(inst)
  }

  return arr
}

async function get_front_resources() {
  let res = await get_resources(ENDPOINTS.front_resources);

  // Machine Arr; We type using classes
  let machines = res.machines;

  let newObj = {
    machines: handle_machinesArr(machines)
  }

  return newObj
}

class RequestQueue {
  constructor(cooldown) {
    this.cooldown = cooldown;
    this.queue = [];
    this.ready = true;
  }

  enqueue(queryFunction) {
    this.queue.push(queryFunction);
    this.tryToProcessNextQuery();
  }

  pause() {
    this.ready = false;
  }

  resume() {
    this.ready = true;
    this.tryToProcessNextQuery();
  }

  tryToProcessNextQuery() {
    if (!this.ready) setTimeout(() => this.tryToProcessNextQuery(), this.cooldown);

    else if (this.queue.length > 0) {
      this.ready = false;
      const queryFunction = this.queue.shift();
      queryFunction().finally(() => {
        setTimeout(() => {
          this.ready = true;
          this.tryToProcessNextQuery();
        }, this.cooldown);
      });
    }
  }
}

class RateLimiter {
  constructor(limit, interval) {
    this.limit = limit; // Limit for number of calls
    this.interval = interval; // Interval in milliseconds
    this.callTimes = []; // Array to keep track of call timestamps
  }

  checkLimit(callback) {
    const now = Date.now();
    this.callTimes = this.callTimes.filter(time => now - time < this.interval);

    if (this.callTimes.length < this.limit) {
      this.callTimes.push(now);
      callback();
    } else {
      console.warn('Rate limit exceeded. Try again later.');
    }
  }
}

// @ EXPORTS
const __EXP__ = {

  // SpcFORK - https://replit.com/@SpcFORK/SpcFORK?v=1
  // © 2023 SpcFORK

  get_connected,
  get_back_resources,
  get_front_resources,

  RequestQueue,
  ENDPOINTS,
  USER_AGENT,
  RateLimiter

}

// @ Runtime Check
globalThis.module
  ? module.exports = __EXP__
  : globalThis.fpAPI = __EXP__