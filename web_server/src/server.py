class Server:
    __slots__ = 'running'

    def __init__(self) -> None:
        self.running: bool = False
    
    def run(self):
        print("Running server")
        self.running = True

        while self.running:
            self._mainloop()
            

    def _mainloop(self):
        ...

    
def run_server():
    serv = Server()
    serv.run()


if __name__ == "__main__":
    run_server()