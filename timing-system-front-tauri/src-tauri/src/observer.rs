use std::collections::HashMap;

#[derive(Hash, Eq, PartialEq, Copy, Clone)]
struct ListenerId(u32);

pub struct Observer<T> {
    subject: T,
    callbacks: HashMap<ListenerId, Box<dyn Fn(&T) -> ()>>,
    listener_counter: u32,
}

impl<T> Observer<T> {
    fn on(&mut self, callback: Box<dyn Fn(&T) -> ()>) -> ListenerId {
        let id = ListenerId(self.listener_counter);
        self.callbacks.insert(id, callback);
        self.listener_counter += 1;
        id
    }
    fn off(&mut self, listener_id: &ListenerId) {
        self.callbacks.remove(listener_id);
    }

    fn modify<F>(&mut self, modifier: F)
    where
        F: (FnOnce(&mut Self) -> ()),
    {
        modifier(self);
        for callback in self.callbacks.values() {
            callback(&self.subject);
        }
    }

    fn get(&self) -> &T {
        &self.subject
    }
}
