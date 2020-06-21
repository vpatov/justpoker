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
# https://cloud.google.com/compute/docs/instance-groups/rolling-out-updates-to-managed-instance-groups#replacement_method
gcloud beta compute instance-groups managed rolling-action replace jp-instance-group --zone us-central1-a

# pull image from GCR
# docker pull gcr.io/justpoker-279900/justpoker:latest

# delete image from GCR
# gcloud container images gcr.io/justpoker-279900/justpoker:latest --force-delete-tags

# update instance-group with spcific instance template, use for versioning
# https://stackoverflow.com/questions/61646980/best-practices-for-deploying-a-new-container-image-to-an-autoscaling-managed-ins
# gcloud compute instance-groups managed rolling-action start-update jp-instance-group --version template=jp-instance-template --zone us-central1-a

