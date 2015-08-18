#!/bin/bash
# just in case, be sure no prior service is running
./StopService.sh

# now start a new service
echo Starting Edgar Renderer service
nohup ./BuilderService.sh > nohup.out &
