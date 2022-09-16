import axios from 'axios';

const nodeStoneServer = process.env['NODESTONE_URL'] || 'localhost:8080';

export default axios.create({ baseURL: `http://${nodeStoneServer}/` });
