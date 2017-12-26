class Communicator {
  constructor(socket) {
    this.socket = socket;
  }
  paperService() {
    return this.socket.service('paper');
  }
  findPapers() {
    return this.paperService().find();
  }
}
export default Communicator;