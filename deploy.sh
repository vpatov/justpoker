# build docker image
echo "building docker image...";
docker build --build-arg build_env=PROD -t justpoker ./;


# Commands for google contrainer registery (GCR)
# after build, run to tag image for GCR
echo "tagging image for google contrainer registery...";
docker tag justpoker gcr.io/justpoker-279900/justpoker:latest;

# push image to GCR
echo "pushing image to google contrainer registery...";
docker push gcr.io/justpoker-279900/justpoker:latest;

# update image on VM
echo "updating vm instance group on google compute engine...";
gcloud compute instances update-container jp-instance-group-p6zb --zone us-central1-a --container-image gcr.io/justpoker-279900/justpoker:latest;

# pull image from GCR
# docker pull gcr.io/justpoker-279900/justpoker:latest

# delete image from GCR
# gcloud container images gcr.io/justpoker-279900/justpoker:latest --force-delete-tags


