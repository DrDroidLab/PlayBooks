git checkout main
git pull origin main

git tag $1
git push origin tag $1

sh build.sh $1
sh build_web.sh $1