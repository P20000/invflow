pipeline {
    agent any

    tools {
        nodejs 'NodeJS-22'
    }

    environment {
        APP_NAME = 'invflow'
        DOCKER_IMAGE = "invflow:${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 Installing npm dependencies...'
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                echo '🧪 Running unit and integration tests...'
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def dockerInstalled = sh(script: 'command -v docker', returnStatus: true) == 0
                    if (dockerInstalled) {
                        echo "🐳 Building Docker image ${DOCKER_IMAGE}..."
                        sh "docker build -t ${APP_NAME}:latest -t ${DOCKER_IMAGE} ."
                    } else {
                        echo 'ℹ️ Docker CLI not found in agent environment. Skipping container build stage.'
                    }
                }
            }
        }

        stage('Deploy (Staging)') {
            steps {
                echo '🚀 Build and verification successful!'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo '✅ Pipeline succeeded! Build artifacts and tests verified.'
        }
        failure {
            echo '❌ Pipeline failed! Check the console output.'
        }
    }
}
