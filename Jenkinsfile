pipeline {
  agent any

  environment {
    MODULE = "VIEW_ERP_MOBILE"

    // public port
    WEB_PORT=54201;

    // docker registry config
    REGISTRY_SERVER = "registry29199428.totalo.in"
    REGISTRY_USERNAME = "totalo"
    REGISTRY_PASSWORD = "totalo8990"

    DOCKER_STACK = "totalo"
    DOCKER_SERVICE_NAME = "view-erp-mobile"

    DOCKER_IMAGE_TAG = "0.1.2"

    DOCKER_STACK_SERVICE = "${DOCKER_STACK}_${DOCKER_SERVICE_NAME}"
    DOCKER_IMAGE_NAME = "${REGISTRY_SERVER}/${DOCKER_SERVICE_NAME}:${DOCKER_IMAGE_TAG}"

    // SLACK Notification Colors
    SLACK_SUCCESS = "#5cb85c"
    SLACK_FAILURE = "#e74c3c"
    SLACK_WARNING = "#e67e22"
  }

  stages {

    stage('install-dependencies'){
      steps {
        sh 'npm install'
      }
      post{
        failure{
          notify("${SLACK_FAILURE}", 'Failed to install dependencies of npm.')
        }
      }
    }

    stage('generate build'){
      steps {
        sh 'npm run build'
      }
      post{
        failure{
          notify("${SLACK_FAILURE}", 'Failed to generate dist build for npm.')
        }
      }
    }

    stage('docker-build'){
      steps {
        sh 'docker build -t ${DOCKER_IMAGE_NAME} . --compress=true'
      }
      post{
        failure{
          notify("${SLACK_FAILURE}", 'Failed to build docker image.')
        }
      }
    }

    stage('docker-push'){
      steps {
        sh 'docker login -u ${REGISTRY_USERNAME} -p ${REGISTRY_PASSWORD} ${REGISTRY_SERVER}'
        sh 'docker push ${DOCKER_IMAGE_NAME}'
      }
      post{
        failure{
          notify("${SLACK_FAILURE}", 'Failed to push image to private registry.')
        }
      }
    }

    stage('generate-artifacts'){
      environment {
        DOCKER_IMAGE_FILE = "${DOCKER_IMAGE_NAME}.tar.gz"
        ARTIFACT_DIR = "artifacts/${DOCKER_SERVICE_NAME}"
        ARTIFACT_WITH_FILE = "${ARTIFACT_DIR}/${DOCKER_IMAGE_FILE}"
      }
      steps {
        sh 'mkdir -p "${ARTIFACT_DIR}/${REGISTRY_SERVER}"'
        sh 'docker save -o "${ARTIFACT_WITH_FILE}" ${DOCKER_IMAGE_NAME}'
        archiveArtifacts "${ARTIFACT_WITH_FILE}"
      }
      post{
        failure{
          notify("${SLACK_FAILURE}", 'Failed to generate artifacts.')
        }
      }
    }

    stage('service-run'){
      steps {
        // sh "mkdir -p ~/${DOCKER_SERVICE_NAME}"
        script {
          try {
            sh '''#!/bin/bash -xe
            if [ "$(docker service inspect ${DOCKER_STACK_SERVICE} 2> /dev/null)" != "[]" ]; then
                echo "removing service ${DOCKER_STACK_SERVICE}"
                docker service rm ${DOCKER_STACK_SERVICE}
            fi
            '''
          }
          catch (e) {
            echo 'Failed to remove service ${DOCKER_STACK_SERVICE}'
            throw e
          }
        }
        sh "docker stack deploy -c docker-compose.yml --with-registry-auth ${DOCKER_STACK}"
      }
      post{
        failure{
          notify("${SLACK_FAILURE}", 'Failed to Run Service.')
        }
      }
    }
  }

  post {
    success {
      notify("${SLACK_SUCCESS}",'build completed, Running Successfully')
    }
    unstable {
      notify("${SLACK_WARNING}",'build with unstable image')
    }
  }

}

def notify(String color, String message) {
  slackSend (color: color, message: "> *${MODULE}* *${message}*: Job `${env.JOB_NAME}` `[${env.BUILD_NUMBER}]`' `(${env.BUILD_URL})`")
}
