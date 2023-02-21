#!/usr/bin/env bash

RUST_LOG=trace cargo run |& tee lastlog.log
